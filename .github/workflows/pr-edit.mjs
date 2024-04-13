// Import statements
import fetch from 'node-fetch';
import { context } from '@actions/github';

async function updatePRTitle() {
  const prDetailsUrl = `https://api.github.com/repos/${context.repo.owner}/${context.repo.repo}/pulls/${context.payload.pull_request.number}`;
  const response = await fetch(prDetailsUrl, {
    headers: {
      Authorization: `token ${process.env.GITHUB_TOKEN}`,
      Accept: 'application/vnd.github.v3+json'
    }
  });

  const pr = await response.json();

  const baseBranch = pr.base.ref;
  if (baseBranch.startsWith('dev/')) {
    const branchCode = baseBranch.split('/').pop();
    const originalTitle = pr.title;
    const newTitle = `[${branchCode}] ${originalTitle}`;

    if (originalTitle !== newTitle) {
      const updateResponse = await fetch(prDetailsUrl, {
        method: 'PATCH',
        headers: {
          Authorization: `token ${process.env.GITHUB_TOKEN}`,
          'Content-Type': 'application/json',
          Accept: 'application/vnd.github.v3+json'
        },
        body: JSON.stringify({ title: newTitle })
      });

      if (!updateResponse.ok) {
        throw new Error(`Failed to update PR title: ${await updateResponse.text()}`);
      }

      console.log(`PR title updated to "${newTitle}"`);
    } else {
      console.log('No update needed, title is already up to date');
    }
  } else {
    console.log('Base branch does not start with "dev/", no update needed');
  }
}

updatePRTitle().catch(error => console.error(`An error occurred: ${error.message}`));
