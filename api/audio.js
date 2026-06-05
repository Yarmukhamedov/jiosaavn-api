import forge from "node-forge";

export const config = {
  regions: ["bom1"]
};

function decrypt(
  encryptedMediaUrl
) {

  const key =
    "38346591";

  const encrypted =
    forge.util.decode64(
      encryptedMediaUrl
    );

  const decipher =
    forge.cipher.createDecipher(
      "DES-ECB",
      forge.util.createBuffer(key)
    );

  decipher.start();

  decipher.update(
    forge.util.createBuffer(
      encrypted
    )
  );

  decipher.finish();

  return decipher.output.getBytes();
}

export default async function handler(
  req,
  res
) {

  res.setHeader(
    "Access-Control-Allow-Origin",
    "*"
  );

  const encryptedMediaUrl =
    req.query.emu;

  const quality =
    req.query.quality || "96";

  if (!encryptedMediaUrl) {
    return res.status(400).json({
      status: false,
      message:
        "Missing encrypted_media_url",
    });
  }

  try {

    const decryptedLink =
      decrypt(
        encryptedMediaUrl
      );

    const validQualities = {
      "12": "_12",
      "48": "_48",
      "96": "_96",
      "160": "_160",
      "320": "_320",
    };

    const qualitySuffix =
      validQualities[
        quality
      ] || "_96";

    const audioUrl =
      decryptedLink.replace(
        "_96",
        qualitySuffix
      );

    return res.status(200).json({
      quality:
        `${quality}kbps`,

      url:
        audioUrl,
    });

  } catch (err) {

    return res.status(500).json({
      status: false,
      message:
        err.message,
    });
  }
}
