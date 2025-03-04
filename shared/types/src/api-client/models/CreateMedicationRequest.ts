/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

export type CreateMedicationRequest = {
    name: string;
    dosage: string;
    instructions: string;
    careRecipientId: string;
    schedule: {
        daysOfWeek: Array<string>;
        times: Array<string>;
    };
    isActive?: boolean;
    daysOfWeek?: Array<string>;
};

