import { Navigate, useParams } from "react-router-dom";

/** Old reset links used `/wall/reset-password/:token` — forward to query-string form. */
export default function WallResetPasswordLegacyRedirect() {
  const { token } = useParams<{ token: string }>();
  if (!token) {
    return <Navigate to="/wall/reset-password" replace />;
  }
  return (
    <Navigate
      to={`/wall/reset-password?token=${encodeURIComponent(token)}`}
      replace
    />
  );
}
