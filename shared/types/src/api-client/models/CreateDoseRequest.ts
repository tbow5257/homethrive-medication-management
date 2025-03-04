/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

export type CreateDoseRequest = {
    medicationId: string;
    scheduleId: string;
    scheduledTime: string;
    status?: CreateDoseRequest.status;
};

export namespace CreateDoseRequest {

    export enum status {
        TAKEN = 'taken',
    }


}

