import { APIGatewayTokenAuthorizerEvent } from "aws-lambda";
import jwt, { JwtPayload } from 'jsonwebtoken';

interface TokenPayload extends JwtPayload {
    userId: string;
}

export const handler = async (event: APIGatewayTokenAuthorizerEvent) => {
  try {
    const token = event.authorizationToken.replace('Bearer ', '');

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as TokenPayload;
    
    return {
      principalId: decoded.userId,
      policyDocument: {
        Version: '2012-10-17',
        Statement: [{
          Action: 'execute-api:Invoke',
          Effect: 'Allow',
          Resource: event.methodArn
        }]
      }
    };
  } catch (error) {
    return {
      principalId: 'user',
      policyDocument: {
        Version: '2012-10-17',
        Statement: [{
          Action: 'execute-api:Invoke',
          Effect: 'Deny',
          Resource: event.methodArn
        }]
      }
    };
  }
};