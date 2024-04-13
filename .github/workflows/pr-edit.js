module.exports = async ({ github }) => {
  const fetch = require('node-fetch');
  const core = require('@actions/core');
  const github = require('@actions/github');

  async function updateTitle() {
    try {
      const { context } = github;
      const pr_number = context.payload.pull_request.number;
      const base_branch = context.payload.pull_request.base.ref;

      if (base_branch.startsWith('dev/')) {
        const branch_code = base_branch.split('/').pop();
        const original_title = context.payload.pull_request.title;
        const new_title = `[${branch_code}] ${original_title}`;

        if (original_title !== new_title) {
          const url = `https://api.github.com/repos/${context.repo.owner}/${context.repo.repo}/pulls/${pr_number}`;
          const response = await fetch(url, {
            method: 'PATCH',
            headers: {
              Authorization: `token ${process.env.GITHUB_TOKEN}`,
              Accept: 'application/vnd.github.v3+json'
            },
            body: JSON.stringify({ title: new_title })
          });

          if (!response.ok) {
            throw new Error(`Failed to update PR title: ${response.statusText}`);
          }

          console.log(`PR title updated to "${new_title}"`);
        } else {
          console.log('No update needed');
        }
      } else {
        console.log('Base branch does not start with "dev/", no update needed');
      }
    } catch (error) {
      core.setFailed(`An error occurred: ${error.message}`);
    }
  }

  updateTitle();
};
