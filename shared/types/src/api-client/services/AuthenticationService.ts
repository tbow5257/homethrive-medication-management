/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { AuthResponse } from '../models/AuthResponse';
import type { LoginRequest } from '../models/LoginRequest';
import type { RegisterRequest } from '../models/RegisterRequest';
import type { UserProfile } from '../models/UserProfile';

import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export class AuthenticationService {

    /**
     * Register a new user
     * @param requestBody
     * @returns AuthResponse Ok
     * @throws ApiError
     */
    public static register(
        requestBody: RegisterRequest,
    ): CancelablePromise<AuthResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/auth/register',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Bad request`,
            },
        });
    }

    /**
     * Login a user
     * @param requestBody
     * @returns AuthResponse Ok
     * @throws ApiError
     */
    public static login(
        requestBody: LoginRequest,
    ): CancelablePromise<AuthResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/auth/login',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Bad request`,
                401: `Unauthorized`,
            },
        });
    }

    /**
     * Get current user profile
     * @param userId
     * @returns UserProfile Ok
     * @throws ApiError
     */
    public static getProfile(
        userId: string,
    ): CancelablePromise<UserProfile> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/auth/profile/{userId}',
            path: {
                'userId': userId,
            },
            errors: {
                401: `Unauthorized`,
            },
        });
    }

}
