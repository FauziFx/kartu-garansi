import axios from "axios";
import moment from "moment";
import fs from "fs";

const URL = "http://localhost:4000/";

export const storeData = async (req, res) => {
  const {
    nama,
    frame,
    lensa,
    rsph,
    rcyl,
    raxis,
    radd,
    rmpd,
    lsph,
    lcyl,
    laxis,
    ladd,
    lmpd,
    garansi_lensa,
    garansi_frame,
    optik_id,
  } = req.body;

  const r = [rsph, rcyl, raxis, radd, rmpd].join("/");
  const l = [lsph, lcyl, laxis, ladd, lmpd].join("/");
  const dateNow = await getCurrentDate();
  const expiredLensa =
    garansi_lensa === "-"
      ? dateNow
      : garansi_lensa === "6"
      ? moment.utc(dateNow).add("6", "M").format()
      : moment.utc(dateNow).add(garansi_lensa, "y").format();

  const expiredFrame =
    garansi_frame === "-"
      ? dateNow
      : garansi_frame === "6"
      ? moment.utc(dateNow).add("6", "M").format()
      : moment.utc(dateNow).add(garansi_frame, "y").format();

  const claimedLensa = garansi_lensa === "-" ? "0" : "1";
  const claimedFrame = garansi_frame === "-" ? "0" : "1";
  try {
    const response = await axios.post(URL + "api/garansi", {
      nama: nama,
      frame: frame,
      lensa: lensa,
      r: r,
      l: l,
      garansi_lensa: garansi_lensa,
      garansi_frame: garansi_frame,
      expired_lensa: expiredLensa,
      expired_frame: expiredFrame,
      claimed_lensa: claimedLensa,
      claimed_frame: claimedFrame,
      tanggal: dateNow,
      optik_id: optik_id,
    });

    res.redirect("/");
  } catch (error) {
    // Offline
    throw error;
  }
};

export const Home = async (req, res) => {
  try {
    if (fs.readFileSync("./data.json", "utf8").length !== 0) {
      let list = JSON.parse(fs.readFileSync("./data.json", "utf-8"));

      list.forEach((object) => {
        delete object["id"];
      });

      const newList = JSON.stringify(list);

      try {
        const response = await axios.post(URL + "api/garansi/bulk", {
          newList,
        });

        fs.writeFileSync("./data.json", "");
      } catch (error) {
        throw error;
      }
    }
    const response = await axios.get(URL + "api/garansi");
    const responseOptik = await axios.get(URL + "api/optik");

    res.render("index", {
      moment: moment,
      datas: response.data.data,
      dataOptik: responseOptik.data.data,
      status: "online",
    });
  } catch (error) {
    throw error;
  }
};

export const PrintPage = async (req, res) => {
  const { id } = req.params;
  const data = await getDataById(id);
  res.render("print", {
    moment: moment,
    data: data,
  });
};

export const InfoPage = async (req, res) => {
  const { id } = req.params;
  const data = await getDataById(id);
  res.render("info", {
    moment: moment,
    data: data,
  });
};

export const EditPage = async (req, res) => {
  const { id } = req.params;
  const data = await getDataById(id);
  const responseOptik = await axios.get(URL + "api/optik");
  res.render("edit", {
    data: data,
    optik_id: data.optik_id,
    dataOptik: responseOptik.data.data,
  });
};

const getDataById = async (id) => {
  try {
    const response = await axios.get(URL + "api/garansi/" + id);
    return response.data;
  } catch (error) {
    throw error;
  }
};

const getCurrentDate = async () => {
  const dateObj = new Date();

  let year = dateObj.getFullYear();

  let month = dateObj.getMonth();
  month = ("0" + (month + 1)).slice(-2);
  // To make sure the month always has 2-character-format. For example, 1 => 01, 2 => 02

  let date = dateObj.getDate();
  date = ("0" + date).slice(-2);
  // To make sure the date always has 2-character-format

  let hour = dateObj.getHours();
  hour = ("0" + hour).slice(-2);
  // To make sure the hour always has 2-character-format

  let minute = dateObj.getMinutes();
  minute = ("0" + minute).slice(-2);
  // To make sure the minute always has 2-character-format

  let second = dateObj.getSeconds();
  second = ("0" + second).slice(-2);
  // To make sure the second always has 2-character-format

  const time = `${year}-${month}-${date}T${hour}:${minute}:${second}.000Z`;
  return time;
};

export const UpdateData = async (req, res) => {
  const { id } = req.params;
  const {
    nama,
    frame,
    lensa,
    rsph,
    rcyl,
    raxis,
    radd,
    rmpd,
    lsph,
    lcyl,
    laxis,
    ladd,
    lmpd,
    garansi_lensa,
    garansi_frame,
    optik_id,
  } = req.body;

  const r = [rsph, rcyl, raxis, radd, rmpd].join("/");
  const l = [lsph, lcyl, laxis, ladd, lmpd].join("/");

  const dateNow = await getCurrentDate();
  const expiredLensa =
    garansi_lensa === "-"
      ? dateNow
      : garansi_lensa === "6"
      ? moment.utc(dateNow).add("6", "M").format()
      : moment.utc(dateNow).add(garansi_lensa, "y").format();

  const expiredFrame =
    garansi_frame === "-"
      ? dateNow
      : garansi_frame === "6"
      ? moment.utc(dateNow).add("6", "M").format()
      : moment.utc(dateNow).add(garansi_frame, "y").format();

  const claimedLensa = garansi_lensa === "-" ? "0" : "1";
  const claimedFrame = garansi_frame === "-" ? "0" : "1";

  try {
    const response = await axios.put(URL + "api/garansi", {
      id: id,
      nama: nama,
      frame: frame,
      lensa: lensa,
      r: r,
      l: l,
      garansi_lensa: garansi_lensa,
      garansi_frame: garansi_frame,
      expired_lensa: expiredLensa,
      expired_frame: expiredFrame,
      claimed_lensa: claimedLensa,
      claimed_frame: claimedFrame,
      optik_id: optik_id,
    });

    if (response.data.success === true) {
      res.redirect("/");
    }
  } catch (error) {
    throw error;
  }
};

export const DeleteData = async (req, res) => {
  const { id } = req.params;

  try {
    const response = await axios.delete(URL + "api/garansi/" + id);

    if (response.data.success === true) {
      res.redirect("/");
    }
  } catch (error) {
    throw error.message;
  }
};
