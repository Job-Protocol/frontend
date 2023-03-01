// @ts-nocheck
import type { NextApiRequest, NextApiResponse } from "next";
import { getConfig, postMessage } from "@/utils";
import FormData from 'form-data';

import customer_config from "@/customer_config.json";


export async function curate_role_by_id(
  id: string,
  method: "add" | "remove" | undefined,
  key: string
): Promise<boolean> {
  let myHeaders = new Headers();
  myHeaders.append("Authorization", "Bearer ".concat(key));

  let formdata = new FormData();
  if (method == "add") {
    formdata.append(
      "partner_boards",
      JSON.stringify([customer_config.jobprotocol_key])
    );
  } else if (method == "remove") {
    formdata.append("partner_boards", JSON.stringify([]));
  } else {
    false;
  }
  console.log("formdata", formdata);

  //   let url = new URLSearchParams(formdata as any).toString();

  // @ts-ignore
  const requestOptions: RequestInit = {
    body: formdata,
    method: "PATCH",
    headers: myHeaders,
    redirect: "follow",
  };
  console.log("requestOptions", requestOptions);



  const url_role: string = getConfig()["endpoint"] + "/obj/role/" + id;
  console.log("url_role", url_role);

  try {
    const result: any = await fetch(url_role, requestOptions);
    console.log("result", result);
  } catch (e) {
    console.log("THE ERROR", e);
    return false
  }
  return true;
}

interface IResponse {
  message: string
}

export default async function role_handler(
  req: NextApiRequest,
  res: NextApiResponse<IResponse>
) {
  console.log("req.query", process.env.BUBBLE_API_PRIVATE_KEY, customer_config.jobprotocol_key);

  const method: string | undefined = req.method;
  const { id } = req.query;
  const body = req.body;
  //console.log("body", body);
  //console.log("id", id);

  if (!id) {
    res.status(400).json({ message: "Missing id" });
    return;
  }

  if (typeof id !== "string") {
    res.status(400).json({ message: "Cant process batch requests" });
    return;
  }

  const success: boolean = await curate_role_by_id(
    id,
    req.query.method,
    process.env.BUBBLE_API_PRIVATE_KEY as string
  );
  if (success) {
    res.status(200).json({ message: "Success" });
  } else {
    res.status(402).json({ message: "Role curation failed" });
  }
}
