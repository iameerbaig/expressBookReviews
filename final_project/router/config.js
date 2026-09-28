// Single source of truth for the JWT signing secret, shared between the
// login route (signs) and the auth middleware (verifies) so the two can
// never drift apart. Override with the JWT_SECRET env var in real deployments.
module.exports.JWT_SECRET = process.env.JWT_SECRET || "access";
