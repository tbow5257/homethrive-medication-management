import { APIGatewayTokenAuthorizerEvent } from "aws-lambda";
import jwt, { JwtPayload } from 'jsonwebtoken';

interface TokenPayload extends JwtPayload {
    userId: string;
}

export const handler = async (event: APIGatewayTokenAuthorizerEvent) => {
    try {
      // Get token from Authorization header
      const token = event.authorizationToken.replace('Bearer ', '');
      
      // Verify using SAME secret as AuthController
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
      throw new Error('Unauthorized');
    }
  };
