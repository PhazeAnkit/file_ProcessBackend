import { Request, Response } from "express";
import { getUsers } from "../services/dataServices";

const dataController = {
  async getData(req: Request, res: Response) {
    try {
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 50;
      const education = req.query.education?.toString();

      if (page < 1 || isNaN(page)) {
        return res
          .status(400)
          .json({ error: "page must be a positive number" });
      }

      if (limit < 1 || limit > 100 || isNaN(limit)) {
        return res
          .status(400)
          .json({ error: "limit must be a number between 1 and 100" });
      }

      const result = await getUsers({ page, limit, education });

      return res.status(200).json(result);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: "Something went wrong" });
    }
  },
};

export default dataController;
