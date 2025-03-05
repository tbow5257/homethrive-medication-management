/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

export type FlattenedMedicationResponse = {
    id: string;
    name: string;
    dosage: string;
    instructions: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    careRecipientId: string;
    careRecipientFirstName?: string;
    careRecipientLastName?: string;
    careRecipientFullName?: string;
    scheduleIds?: Array<string>;
    scheduleTimes?: Array<Array<string>>;
    scheduleDaysOfWeek?: Array<Array<string>>;
};

