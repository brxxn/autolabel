// probably the most useless class xd


class ProcessIssueResult {

    constructor(success, message=null) {
        this.success = success;
        this.message = message;
        if (success && !message) {
            this.message = 'successfully processed issue';
        }
    }

    isSuccess() {
        return this.success
    }

    getMessage() {
        return this.message
    }

}

module.exports = ProcessIssueResult