/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

export type UpdateDoseStatusRequest = {
    status: UpdateDoseStatusRequest.status;
};

export namespace UpdateDoseStatusRequest {

    export enum status {
        SCHEDULED = 'scheduled',
        TAKEN = 'taken',
        MISSED = 'missed',
        SKIPPED = 'skipped',
    }


}

