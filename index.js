import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import {
  storeData,
  Home,
  PrintPage,
  InfoPage,
  EditPage,
  UpdateData,
  DeleteData,
} from "./controllers/GaransiController.js";
import bodyParser from "body-parser";

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.set("view engine", "ejs");
app.set("views", __dirname + "/views");
app.use(express.static("public"));
app.use("/bootstrap", express.static("node_modules/bootstrap/dist"));
app.use(
  "/fontawesome",
  express.static("node_modules/@fortawesome/fontawesome-free")
);

app.get("/", Home);

app.post("/store", storeData);

app.get("/print/:id", PrintPage);

app.get("/info/:id", InfoPage);

app.get("/edit/:id", EditPage);

app.post("/update/:id", UpdateData);

app.get("/delete/:id", DeleteData);

app.listen(3000, () => {
  console.log("App listening on http://localhost:3000/");
});
