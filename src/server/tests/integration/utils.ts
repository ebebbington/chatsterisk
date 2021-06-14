export async function getToken() {
  const res = await fetch("http://drash_server:1667");
  await res.text();
  const cookieHeader = res.headers.get("set-cookie");
  const [_headerName, cookeiVal] = cookieHeader!.split("=");
  return cookeiVal;
}
