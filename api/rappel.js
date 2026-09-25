// Renvoie un fichier de rendez-vous (.ics) que le Calendrier de l'iPhone sait ajouter
module.exports = (req, res) => {
  const q = req.query || {};
  const debut = String(q.debut || "");
  if (!/^\d{8}T\d{6}Z$/.test(debut)) {
    res.statusCode = 400;
    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.end("Date invalide");
    return;
  }
  const propre = (t, max) => String(t || "")
    .slice(0, max)
    .replace(/[\r\n]+/g, " ")
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\;")
    .replace(/,/g, "\\,");
  const titre = propre(q.titre || "Changer ma pile", 80);
  const details = propre(q.details, 200);

  // fin = début + 15 minutes
  const d = new Date(Date.UTC(+debut.slice(0,4), +debut.slice(4,6)-1, +debut.slice(6,8), +debut.slice(9,11), +debut.slice(11,13)));
  const utc = (x) => x.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
  const fin = utc(new Date(d.getTime() + 15 * 60000));

  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Piles//FR",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    "UID:" + debut + "-" + Math.random().toString(36).slice(2) + "@piles",
    "DTSTAMP:" + utc(new Date()),
    "DTSTART:" + debut,
    "DTEND:" + fin,
    "SUMMARY:" + titre,
    "DESCRIPTION:" + details,
    "BEGIN:VALARM",
    "ACTION:DISPLAY",
    "DESCRIPTION:" + titre,
    "TRIGGER:PT0M",
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR",
    ""
  ].join("\r\n");

  res.statusCode = 200;
  res.setHeader("Content-Type", "text/calendar; charset=utf-8");
  res.setHeader("Content-Disposition", 'inline; filename="rappel-pile.ics"');
  res.setHeader("Cache-Control", "no-store");
  res.end(ics);
};
