/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CareRecipient } from '../models/CareRecipient';
import type { CareRecipientResponse } from '../models/CareRecipientResponse';
import type { CreateCareRecipientRequest } from '../models/CreateCareRecipientRequest';
import type { UpdateCareRecipientRequest } from '../models/UpdateCareRecipientRequest';

import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export class CareRecipientsService {

    /**
     * Get all care recipients
     * @returns CareRecipient Ok
     * @throws ApiError
     */
    public static getCareRecipients(): CancelablePromise<Array<CareRecipient>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/care-recipients',
        });
    }

    /**
     * Create a new care recipient
     * @param requestBody
     * @returns CareRecipient Ok
     * @throws ApiError
     */
    public static createCareRecipient(
        requestBody: CreateCareRecipientRequest,
    ): CancelablePromise<CareRecipient> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/care-recipients',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Bad request`,
            },
        });
    }

    /**
     * Get a care recipient by ID
     * @param id
     * @returns CareRecipientResponse Ok
     * @throws ApiError
     */
    public static getCareRecipient(
        id: string,
    ): CancelablePromise<CareRecipientResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/care-recipients/{id}',
            path: {
                'id': id,
            },
            errors: {
                404: `Care recipient not found`,
            },
        });
    }

    /**
     * Update a care recipient
     * @param id
     * @param requestBody
     * @returns CareRecipient Ok
     * @throws ApiError
     */
    public static updateCareRecipient(
        id: string,
        requestBody: UpdateCareRecipientRequest,
    ): CancelablePromise<CareRecipient> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/care-recipients/{id}',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Bad request`,
                404: `Care recipient not found`,
            },
        });
    }

    /**
     * Delete a care recipient (mark as inactive)
     * @param id
     * @returns void
     * @throws ApiError
     */
    public static deleteCareRecipient(
        id: string,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/care-recipients/{id}',
            path: {
                'id': id,
            },
            errors: {
                404: `Care recipient not found`,
            },
        });
    }

}
