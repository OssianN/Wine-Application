import mongoose, { Schema, model } from 'mongoose';

const authorizationCodeSchema = new Schema({
  codeHash: { type: String, required: true, unique: true },
  userId: { type: String, required: true },
  clientId: { type: String, required: true },
  redirectUri: { type: String, required: true },
  codeChallenge: { type: String, required: true },
  resource: { type: String, required: true },
  scope: { type: String, required: true },
  expiresAt: { type: Date, required: true },
  consumed: { type: Boolean, default: false },
});

authorizationCodeSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const refreshTokenSchema = new Schema({
  tokenHash: { type: String, required: true, unique: true },
  userId: { type: String, required: true },
  clientId: { type: String, required: true },
  scope: { type: String, required: true },
  revoked: { type: Boolean, default: false },
});

const clientSchema = new Schema({
  clientId: { type: String, required: true, unique: true },
  redirectUris: { type: [String], required: true },
  tokenEndpointAuthMethod: { type: String, default: 'none' },
  createdAt: { type: Date, default: Date.now },
});

if (mongoose.models.oauthAuthorizationCodes) {
  mongoose.deleteModel('oauthAuthorizationCodes');
}
if (mongoose.models.oauthRefreshTokens) {
  mongoose.deleteModel('oauthRefreshTokens');
}
if (mongoose.models.oauthClients) {
  mongoose.deleteModel('oauthClients');
}

export const OAuthAuthorizationCode = model(
  'oauthAuthorizationCodes',
  authorizationCodeSchema
);
export const OAuthRefreshToken = model('oauthRefreshTokens', refreshTokenSchema);
export const OAuthClient = model('oauthClients', clientSchema);
