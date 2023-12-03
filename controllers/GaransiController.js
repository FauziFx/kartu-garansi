import axios from "axios";
import moment from "moment";
import fs from "fs";

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
    const response = await axios.post("http://localhost:4000/api/garansi", {
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
    });

    res.redirect("/");
  } catch (error) {
    // Offline
    if (error.code === "ECONNREFUSED") {
      try {
        let list = JSON.parse(fs.readFileSync("./data.json", "utf-8"));
        let id;
        list.length != 0 ? list.findLast((item) => (id = item.id)) : (id = 0);
        const data = {
          id: id + 1,
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
          tanggal: await getCurrentDate(),
        };
        list.push(data);
        fs.writeFileSync("./data.json", JSON.stringify(list));
        res.redirect("/");
      } catch (error) {
        const data = [
          {
            id: 1,
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
            tanggal: await getCurrentDate(),
          },
        ];
        fs.writeFileSync("./data.json", JSON.stringify(data));
        res.redirect("/");
      }
    }
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
        const response = await axios.post(
          "http://localhost:4000/api/garansi/bulk",
          { newList }
        );

        fs.writeFileSync("./data.json", "");
      } catch (error) {
        throw error;
      }
    }
    const response = await axios.get("http://localhost:4000/api/garansi");

    res.render("index", {
      moment: moment,
      datas: response.data.data,
      status: "online",
    });
  } catch (error) {
    if (error.code === "ECONNREFUSED") {
      if (fs.readFileSync("./data.json", "utf-8").length === 0) {
        res.render("index", {
          moment: moment,
          datas: "",
          status: "offline",
        });
      } else {
        const data = JSON.parse(fs.readFileSync("./data.json", "utf-8"));
        res.render("index", {
          moment: moment,
          datas: data,
          status: "offline",
        });
      }
    }
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
  res.render("edit", {
    data: data,
  });
};

const getDataById = async (id) => {
  try {
    const response = await axios.get("http://localhost:4000/api/garansi/" + id);
    return response.data;
  } catch (error) {
    let list = JSON.parse(fs.readFileSync("./data.json", "utf-8"));

    return list.filter((data) => data.id === parseInt(id))[0];
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
  } = req.body;

  const r = [rsph, rcyl, raxis, radd, rmpd].join("/");
  const l = [lsph, lcyl, laxis, ladd, lmpd].join("/");

  try {
    const response = await axios.put("http://localhost:4000/api/garansi", {
      id: id,
      nama: nama,
      frame: frame,
      lensa: lensa,
      r: r,
      l: l,
      garansi_lensa: garansi_lensa,
      garansi_frame: garansi_frame,
    });

    if (response.data.success === true) {
      res.redirect("/");
    }
  } catch (error) {
    if (error.code === "ECONNREFUSED") {
      let list = JSON.parse(fs.readFileSync("./data.json", "utf-8"));
      let newList = list.filter((item) => item.id !== parseInt(id));
      let listEdit = list.filter((item) => item.id === parseInt(id));
      const data = {
        id: listEdit[0].id,
        nama: nama,
        frame: frame,
        lensa: lensa,
        r: r,
        l: l,
        garansi_lensa: garansi_lensa,
        garansi_frame: garansi_frame,
        tanggal: listEdit[0].tanggal,
      };

      newList.push(data);
      fs.writeFileSync("./data.json", JSON.stringify(newList));
      res.redirect("/");
    }
  }
};

export const DeleteData = async (req, res) => {
  const { id } = req.params;

  try {
    const response = await axios.delete(
      "http://localhost:4000/api/garansi/" + id
    );

    if (response.data.success === true) {
      res.redirect("/");
    }
  } catch (error) {
    // throw error.message;
    let list = JSON.parse(fs.readFileSync("./data.json", "utf-8"));

    let newList = list.filter((item) => item.id != parseInt(id));

    fs.writeFileSync("./data.json", JSON.stringify(newList));
    res.redirect("/");
  }
};
