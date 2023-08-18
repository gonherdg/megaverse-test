/*  Candidate: Gonzalo Hernán Del Gaudio
 *   (candidateId a07a7b80-b3ee-41f8-b69c-9a576bb04801)
 *
 *   Thank you for the opportunity to show my skills. I will be happy to discuss
 *   in detail any part of the code.
 */

// Axios module import for API calls
const axios = require("axios");

// Define API URLs:
const baseURL = "https://challenge.crossmint.io/api";
const goalRequestURL = `${baseURL}/map/a07a7b80-b3ee-41f8-b69c-9a576bb04801/goal`;
const polyanetURL = `${baseURL}/polyanets`;
const soloonURL = `${baseURL}/soloons`;
const comethURL = `${baseURL}/comeths`;
const timeInterval = 650; // time between API calls in ms

// Axios configuration
const axiosConfig = {
    headers: {
        "Content-Type": "application/json",
    },
};

// Enums
const ElemType = {
    Space: "SPACE",
    Polyanet: "POLYANET",
    BlueSoloon: "BLUE_SOLOON",
    RedSoloon: "RED_SOLOON",
    WhiteSoloon: "WHITE_SOLOON",
    PurpleSoloon: "PURPLE_SOLOON",
    UpCometh: "UP_COMETH",
    DownCometh: "DOWN_COMETH",
    LeftCometh: "LEFT_COMETH",
    RightCometh: "RIGHT_COMETH",
};

const Direction = {
    Up: "up",
    Down: "down",
    Left: "left",
    Right: "right",
};

const Colors = {
    Red: "red",
    Blue: "blue",
    Purple: "purple",
    White: "white",
};

// This is the base class for the three elements
class SpaceElement {
    constructor(row, column, shouldDelete = false) {
        this.row = row;
        this.column = column;
        this.shouldDelete = shouldDelete;
        this.URL = "";
        this.data = {
            candidateId: "a07a7b80-b3ee-41f8-b69c-9a576bb04801",
            row: row,
            column: column,
        };
    }

    // Call to API to make changes
    setElement = async () => {
        try {
            const data = JSON.stringify(this.data);
            if (!this.shouldDelete) {
                await axios.post(this.URL, data, axiosConfig);
                console.log(
                    `New element successfuly added at row ${this.row}, column ${this.column}]`
                );
            } else {
                await axios.delete(this.URL, {
                    headers: axiosConfig.headers,
                    data,
                });
                console.log(
                    `Element successfuly deleted at row ${this.row}, column ${this.column}`
                );
            }
        } catch (error) {
            const message = `Error: ${error.response.data.reason}`;
            console.error(message);
            return message;
        }
    };
}

class Polyanet extends SpaceElement {
    constructor(row, column, shouldDelete = false) {
        super(row, column, shouldDelete);
        this.URL = polyanetURL;
    }
}

class Soloon extends SpaceElement {
    constructor(row, column, color, shouldDelete = false) {
        super(row, column, shouldDelete);
        this.URL = soloonURL;
        this.data.color = color;
    }
}

class Cometh extends SpaceElement {
    constructor(row, column, direction, shouldDelete = false) {
        super(row, column, shouldDelete);
        this.URL = comethURL;
        this.data.direction = direction;
    }
}

// This is the main class
class App {
    constructor() {
        this.goal = [];
    }

    // Get goal structure to use as guide for the new map
    getGoal = async () => {
        try {
            const response = await axios.get(goalRequestURL, axiosConfig);
            return response.data.goal;
        } catch (error) {
            console.error(
                `Error on fetching goal map: ${error.response.data.message}`
            );
            return null;
        }
    };

    // Distinguish element type and return a new object accordingly
    createElement = async (item, row, column, shouldDelete) => {
        switch (item) {
            default:
                return null;
            case ElemType.Polyanet:
                return new Polyanet(row, column, shouldDelete);
            case ElemType.BlueSoloon:
                return new Soloon(row, column, Colors.Blue, shouldDelete);
            case ElemType.RedSoloon:
                return new Soloon(row, column, Colors.Red, shouldDelete);
            case ElemType.WhiteSoloon:
                return new Soloon(row, column, Colors.White, shouldDelete);
            case ElemType.PurpleSoloon:
                return new Soloon(row, column, Colors.Purple, shouldDelete);
            case ElemType.UpCometh:
                return new Cometh(row, column, Direction.Up, shouldDelete);
            case ElemType.DownCometh:
                return new Cometh(row, column, Direction.Down, shouldDelete);
            case ElemType.LeftCometh:
                return new Cometh(row, column, Direction.Left, shouldDelete);
            case ElemType.RightCometh:
                return new Cometh(row, column, Direction.Right, shouldDelete);
        }
    };

    // Main function
    main = async (shouldDelete = false) => {
        // Step 1: Load the goal map
        try {
            console.log("- Loading goal map ...");
            this.goal = await this.getGoal();
            if (this.goal != null) console.log("Done");
            else return;
        } catch (error) {
            console.error(`Unable to get the goal map from server: ${error}`);
            return;
        }

        // Step 2: Fill the map with the correct items
        try {
            console.log("- Filling the map ...");
            let spaceCount = 0; // Count variable (only for logs)

            // Iterate over rows and columns to create objects and execute the corresponding API calls:
            for (const [rowIdx, row] of this.goal.entries()) {
                for (const [columnIdx, item] of row.entries()) {
                    if(rowIdx > 2) return
                    const newElement = await this.createElement(
                        item,
                        rowIdx,
                        columnIdx,
                        shouldDelete
                    );

                    if (newElement != null) {
                        // Execute addition/deletion:
                        await newElement.setElement();

                        if (spaceCount > 0)
                            console.log(`(Skipped ${spaceCount} spaces)`);
                        spaceCount = 0;

                        // Pause between calls to follow the API limits:
                        await new Promise((resolve) =>
                            setTimeout(resolve, timeInterval)
                        );
                    } else {
                        spaceCount++;
                    }
                }
            }
        } catch (error) {
            console.error(
                `There was an error when completing the map: ${error}`
            );
        } finally {
            console.log("Finished working.");
        }
    };
}

// Start program
const app = new App();
const shouldDelete = false;
app.main(shouldDelete);
