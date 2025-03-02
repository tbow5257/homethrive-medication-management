/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { Medication } from './Medication';

export type CareRecipientResponse = {
    updatedAt: string;
    createdAt: string;
    isActive: boolean;
    dateOfBirth: string;
    lastName: string;
    firstName: string;
    id: string;
    medications?: Array<Medication>;
};

