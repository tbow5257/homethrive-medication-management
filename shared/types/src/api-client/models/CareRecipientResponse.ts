/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { Medication } from './Medication';

export type CareRecipientResponse = {
    isActive: boolean;
    dateOfBirth: string;
    lastName: string;
    firstName: string;
    updatedAt: string;
    createdAt: string;
    id: string;
    medications?: Array<Medication>;
};

