const { Toolkit } = require('actions-toolkit')
const Octokit = require('@octokit/rest');
const ProcessIssueResult = require('../type/process-issue-result')

module.exports = {

    /**
     * Processes an issue
     * @param {Toolkit} tools 
     * @param {Octokit.Response<Octokit.IssuesGetResponse>} issue 
     * @param {Object} args
     * @param {function} success
     * @param {function} failure
     * @returns {ProcessIssueResult}
     */
    processIssue: function (tools, issue, args, success, failure) {
        if (!tools || !issue) {
            failure(new ProcessIssueResult(false, 'tools or issue is null'))
            return;
        }
        var owner = tools.context.issue.owner;
        var repo = tools.context.issue.repo;
        var issue_number = issue.data.number;

        if (issue.data.state === "closed") {
            success(new ProcessIssueResult(true))
            return;
        }

        if (issue.data.labels.length != 0) {
            success(new ProcessIssueResult(true))
            return;
        }

        var issueType = issue.data.pull_request ? 'pull request' : 'issue'

        // [matched]
        var labelRegex = new RegExp('^\\[([a-z]|[A-Z]|\\s)+\\]');
        var matches = labelRegex.exec(issue.data.title);
        if (!matches || matches.length === 0) {
            if (args.requireLabel) {
                var filteredTitle = issue.data.title.replace("\`", "\\\`")
                // i hope you have line wrap enabled.
                var labelMessage = `This ${issueType} has been automatically closed because it did not contain a label. To assign labels, put brackets around it (for example, \`[enchancement] ${issue.data.title}\`). [Here](https://github.com/${owner}/${repo}/labels) is a valid list of labels.\n\n#### Note\n\nThis action was performed automatically by a GitHub action. Please reply to this ${issueType} or ask a contributor if you have any questions.`
                // I don't really care about the order, so it's going to be unsynchronized.
                tools.github.issues.update({
                    owner: owner,
                    repo: repo,
                    issue_number: issue_number,
                    state: "closed"
                })
                tools.github.issues.createComment({
                    owner: owner,
                    repo: repo,
                    issue_number: issue_number,
                    body: labelMessage
                }).then(()=> {
                    success(new ProcessIssueResult(true))
                })
            }
            return
        }
        // simple hacky spell but quite unbreakable.
        var labelName = matches[0].substring(1, matches[0].length-1);
        tools.github.issues.listLabelsForRepo({
            owner: owner,
            repo: repo
        }).then((response) => {
            var labels = response.data;
            var labelNames = [];
            for (var label of labels) {
                labelNames.push(label.name.toLowerCase())
            }
            labelNames = labelNames.filter((value, index, arr) => {
                if (!args.blacklistedLabels || typeof args.blacklistedLabels !== "string") {
                    return true;
                }
                var blacklistedLabels = args.blacklistedLabels.toLowerCase().split(",")
                if (blacklistedLabels.includes(value)) {
                    return false;
                }
                return true;
            })
            if (!labelNames.includes(labelName.toLowerCase())) {
                if (args.requireLabel) {
                    var labelMessage = `This ${issueType} has been automatically closed because ${labelName} is not a label. Please resubmit this ${issueType} with a valid label in brackets. Note that you may also get this error if you do not have permission to use the label.\n\n#### Note\n\nThis action was performed automatically by a GitHub action. Please reply to this ${issueType} or ask a contributor if you have any questions.`
                    tools.github.issues.update({
                        owner: owner,
                        repo: repo,
                        issue_number: issue_number,
                        state: "closed"
                    })
                    tools.github.issues.createComment({
                        owner: owner,
                        repo: repo,
                        issue_number: issue_number,
                        body: labelMessage
                    }).then((data) => {
                        success(new ProcessIssueResult(true))
                    })
                }
                return
            }
            tools.github.issues.update({
                owner: owner,
                repo: repo,
                issue_number: issue_number,
                labels: [labelName.toLowerCase()]
            }).then((data) => {
                success(new ProcessIssueResult(true))
            }).catch((exception) => {
                failure(new ProcessIssueResult(false, JSON.stringify(exception)))
            })
            
        })
    }

}