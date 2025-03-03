/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { CareRecipient } from './CareRecipient';
import type { Medication } from './Medication';

export type DoseResponse = {
    status: string;
    scheduledFor: string;
    takenAt: string;
    updatedAt: string;
    createdAt: string;
    medicationId: string;
    id: string;
    medication?: (Medication & {
        careRecipient?: CareRecipient;
    });
};

