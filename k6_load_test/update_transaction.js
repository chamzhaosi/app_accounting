import http from "k6/http";

export const options = {
  vus: 5,
  iterations: 15,
};

export function setup() {
  const res = http.post(
    "http://host.docker.internal:8080/api/users/login",
    JSON.stringify({
      email: "cham1@gmail.my",
      password: "Abc@123456",
    }),
    {
      headers: { "Content-Type": "application/json" },
    },
  );
  console.log("setup run"); // debug
  return { cookies: res.cookies.access_token[0].value };
}

export default function (data) {
  const payload = JSON.stringify({
    id: 37,
    txnTypeId: 2,
    ctgrId: 2,
    accId: 1,
    description: `Allowance VU${__VU}-ITER${__ITER}`,
    amount: 500 + __VU + __ITER,
    txnDate: "2026-05-19",
    vrs: 6,
  });

  const params = {
    headers: {
      "Content-Type": "application/json",
    },
    cookies: {
      access_token: data.cookies,
    },
  };

  const res = http.put(
    "http://host.docker.internal:8080/api/transactions/update",
    payload,
    params,
  );

  const body = JSON.parse(res.body);
  console.log(res.status + " " + res.body + "\n");
}
