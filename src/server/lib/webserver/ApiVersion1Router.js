const express = require("express");

/**
 * The ApiVersion1Router class is responsible for defining routes related to API version 1.
 * @class
 */
class ApiVersion1Router {
    /**
     * Create a new ApiVersion1Router instance.
     * @constructor
     */
    constructor() {
        // Initialize an Express router for API version 1 routes.
        this.router = express.Router({ mergeParams: true });

        // Initialize the routes defined in the class.
        this.initRoutes();
    }

    /**
     * Get the Express router configured with the defined API version 1 routes.
     * @returns {express.Router} An Express router for API version 1 routes.
     */
    getRouter() {
        return this.router;
    }

    /**
     * Initialize the API version 1 routes.
     */
    initRoutes() {
        // Define a simple GET route that responds with JSON data.
        this.router.get("/", (req, res) => {
            res.json({
                secret: "The cake is a lie"
            });
        });

        // Define a simple GET route that responds with JSON data.
        this.router.get("/lecturer", (req, res) => {
            res.json({
                "UUID": "67fda282-2bca-41ef-9caf-039cc5c8dd69",
                "title_before": "Mgr.",
                "first_name": "Petra",
                "middle_name": "Swil",
                "last_name": "Plachá",
                "title_after": "MBA",
                "picture_url": "https://tourdeapp.cz/storage/images/2023_02_25/412ff296a291f021bbb6de10e8d0b94863fa89308843b/big.png.webp",
                "location": "Brno",
                "claim": "Aktivní studentka / Předsedkyně spolku / Projektová manažerka",
                "bio": "<p>Baví mě organizovat věci. Ať už to bylo vyvíjení mobilních aplikací ve Futured, pořádání konferencí, spolupráce na soutěžích Prezentiáda, pIšQworky, <b>Tour de App</b> a Středoškolák roku, nebo třeba dobrovolnictví, vždycky jsem skončila u projektového managementu, rozvíjení soft-skills a vzdělávání. U studentských projektů a akcí jsem si vyzkoušela snad všechno od marketingu po logistiku a moc ráda to předám dál. Momentálně studuji Pdf MUNI a FF MUNI v Brně.</p>",
                "tags": [
                  {
                    "uuid": "6d348a49-d16f-4524-86ac-132dd829b429",
                    "name": "Dobrovolnictví"
                  },
                  {
                    "uuid": "8e0568c3-e235-42aa-9eaa-713a2545ff5b",
                    "name": "Studentské spolky"
                  },
                  {
                    "uuid": "996c16c8-4715-4de6-9dd0-ea010b3f64c7",
                    "name": "Efektivní učení"
                  },
                  {
                    "uuid": "c20b98dd-f37e-4fa7-aac1-73300abf086e",
                    "name": "Prezentační dovednosti"
                  },
                  {
                    "uuid": "824cfe88-8a70-4ffb-bcb8-d45670226207",
                    "name": "Marketing pro neziskové studentské projekty"
                  },
                  {
                    "uuid": "fa23bea1-489f-4cb2-b64c-7b3cd7079951",
                    "name": "Mimoškolní aktivity"
                  },
                  {
                    "uuid": "8325cacc-1a1f-4233-845e-f24acfd0287b",
                    "name": "Projektový management, event management"
                  },
                  {
                    "uuid": "ba65a665-e141-40ab-bbd2-f4b1f2b01e42",
                    "name": "Fundraising pro neziskové studentské projekty"
                  }
                ],
                "price_per_hour": 1200,
                "contact": {
                  "telephone_numbers": ["+420 722 482 974"],
                  "emails": ["placha@scg.cz", "predseda@scg.cz"]
                }
              });
        });

        this.router.get("*", (req, res) => {
            res.json({
                code: 404,
                error: true
            });
        });
    }
}

module.exports = ApiVersion1Router;
