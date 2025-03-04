/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { CareRecipient } from './CareRecipient';
import type { Medication } from './Medication';

export type ScheduleResponse = {
    updatedAt: string;
    createdAt: string;
    medicationId: string;
    isActive: boolean;
    daysOfWeek: Array<string>;
    times: Array<string>;
    id: string;
    medication?: (Medication & {
        careRecipient?: CareRecipient;
    });
};

