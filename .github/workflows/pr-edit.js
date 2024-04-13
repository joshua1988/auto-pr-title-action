module.exports = async ({github, context}) => {
  const pr_number = context.payload.pull_request.number;
  const source_branch = context.payload.pull_request.head.ref;

  // Retrieve the list of files changed in the PR
  const { data: files } = await github.rest.pulls.listFiles({
    owner: context.repo.owner,
    repo: context.repo.repo,
    pull_number: pr_number
  });

  // Determine if changes were made under 'services' directory
  const serviceChanges = files.filter(file => file.filename.startsWith('services/')).map(file => {
    const parts = file.filename.split('/');
    return parts[1]; // Return the subdirectory directly under 'services'
  });

  // Get unique subdirectory names (avoid duplicates if multiple files in the same subfolder are modified)
  const uniqueServices = [...new Set(serviceChanges)];

  if (source_branch.startsWith('dev/')) {
    const branch_code = source_branch.split('/').pop();
    const original_title = context.payload.pull_request.title;
    let new_title = `[${branch_code}] ${original_title}`;

    // Append the first service subdirectory to the title if any
    if (uniqueServices.length > 0) {
      new_title = `[${branch_code}] (${uniqueServices[0]}) ${original_title}`;
    }

    if (original_title !== new_title) {
      const { data } = await github.rest.pulls.update({
        owner: context.repo.owner,
        repo: context.repo.repo,
        pull_number: pr_number,
        title: new_title
      });

      console.log(`PR title updated to "${data.title}"`);
    } else {
      console.log('No update needed, title is already up to date');
    }
  } else {
    console.log('Source branch does not start with "dev/", no update needed');
  }
};
