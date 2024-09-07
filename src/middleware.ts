import { 
    convexAuthNextjsMiddleware, 
    createRouteMatcher, 
    isAuthenticatedNextjs,
    nextjsMiddlewareRedirect} from "@convex-dev/auth/nextjs/server";
import next from "next";

const isPublicPage = createRouteMatcher(["/auth"])

export default convexAuthNextjsMiddleware((request) => {
    if (!isPublicPage(request) && !isAuthenticatedNextjs()) {
        return nextjsMiddlewareRedirect(request, "/auth");
    }

    if (isPublicPage(request) && isAuthenticatedNextjs()) {
        return nextjsMiddlewareRedirect(request, "/");
    }
    // TODO: Перенаправить пользователя на auth метод 
});
 
export const config = {
  // The following matcher runs middleware on all routes
  // except static assets.
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};