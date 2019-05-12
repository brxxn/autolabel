const { Toolkit } = require('actions-toolkit')
const issueHelper = require('./helpers/process-issue')

// Run your GitHub Action!
Toolkit.run(async tools => {
  if (tools.context.event !== 'issues') {
    tools.exit.failure('event type must be "issues". actions will not be performed until this is updated');
    return;
  }
  var args = tools.arguments;
  tools.github.issues.get({
    owner: tools.context.issue.owner,
    repo: tools.context.issue.repo,
    issue_number: tools.context.issue.number
  }).then(response => {
    if (response.data.pull_request && args.disablePullRequests) {
      tools.exit.success('exited successfully - issue is a pull request.')
      return;
    } else if (!response.data.pull_request && args.disableIssues) {
      tools.exit.success('exited successfully - issue is not a pull request.')
      return;
    }
    var result = issueHelper.processIssue(tools, response, args, (result) => {
      tools.exit.success(result.getMessage())
    }, (result) => {
      tools.exit.failure(result.getMessage())
    });
  });
})
