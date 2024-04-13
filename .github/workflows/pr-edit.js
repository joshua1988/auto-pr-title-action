module.exports = async ({github, context}) => {
  const pr_number = context.payload.pull_request.number;
  const source_branch = context.payload.pull_request.head.ref;
  
  if (source_branch.startsWith('dev/')) {
    const branch_code = source_branch.split('/').pop();
    const original_title = context.payload.pull_request.title;
    const new_title = `[${branch_code}] ${original_title}`;

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
    console.log('Base branch does not start with "dev/", no update needed');
  }
};
