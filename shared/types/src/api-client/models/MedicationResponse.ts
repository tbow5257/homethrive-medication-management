/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { CareRecipient } from './CareRecipient';
import type { Schedule } from './Schedule';

export type MedicationResponse = {
    careRecipientId: string;
    instructions: string;
    dosage: string;
    updatedAt: string;
    createdAt: string;
    isActive: boolean;
    id: string;
    name: string;
    careRecipient?: CareRecipient;
    schedules?: Array<Schedule>;
};

