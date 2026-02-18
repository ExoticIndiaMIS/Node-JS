import {format} from 'date-fns'

export class BaseResponse {
    constructor() {
        this.success = {
            status: false,
            message: "",
            data: {
                count: 0
            }
        };
        this.error = {
            status: false,
            message: "",
        };
        this.warning = {
            status: false,
            message: ""
        };
    }
}
