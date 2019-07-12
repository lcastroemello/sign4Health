const { app } = require("./index");
const supertest = require("supertest");
const cookieSession = require("cookie-session");

// test("GET /home returns h1 as response", (req, res) => {
//     return supertest(app)
//         .get("/home")
//         .then(res => {
//             expect(res.statusCode).toBe(200);
//             expect(res.text).toContain("welcome");
//         });
// });

test("POST / product redirects to /home", () => {
    return supertest(app)
        .post("/product")
        .then(res => {
            expect(res.statusCode).toBe(302);
            expect(res.text).toContain("Found");
            expect(res.headers.location).toBe("/home");
        });
});

test("POST /product sets req.session.wouldLikeToBuy to true", () => {
    //step 1: create the cookie
    let cookie = {};
    //step 2: tell cookie-session-mock that the "cookie" variable is our cookie and that, any time a user writes data to a cookie, it should be placed in the "cookie-variable"
    cookieSession.mockSessionOnce(cookie);
    return supertest(app)
        .post("/product")
        .then(res => {
            console.log("cookie: ", cookie);
            expect(cookie.wouldLikeToBuy).toBe(true);
            expect(res.statusCode).toBe(302);
        });
});
