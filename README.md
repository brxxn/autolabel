# Autolabel

A GitHub Action that automatically labels issues.

## What is it?

This closes issues automatically if they don't use a bracket with a label in front of their post. The label is automatically assigned to the issue. It works on both pull requests and issues, but it can be changed to disable it.

## Installation

**You must be in the GitHub Actions beta.** I, myself, am not in the GitHub Actions beta, which is why I had to use my friend's repository to test it.

1. Create a workflow in `.github/main.workflow`
2. Use the following content in the workflow file:

```
workflow "issues" {
  on = "issues"
  resolves = ["autolabel"]
}

action "autolabel" {
  uses = "brxxn/autolabel@release"
  secrets = ["GITHUB_TOKEN"]
}
```

That's literally all you have to do.

## Configuration

### Command line arguments

* `--requireLabel` - requires that a label is put on every issue
* `--blacklistedLabels duplicate,wontfix` - blacklist labels that shouldn't be accessible. each label should be separated with `,`.
* `--disablePullRequests` - ignores pull requests
* `--disableIssues` - ignores issues.


## Contributing

We don't use the GitHub Action here because we aren't in the beta. Feel free to open issues and make pull requests, just don't be annoying or whatever.