/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

export type RegisterRequest = {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role?: RegisterRequest.role;
};

export namespace RegisterRequest {

    export enum role {
        ADMIN = 'admin',
        CAREGIVER = 'caregiver',
    }


}

