import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { MercadoPagoConfig, Preference } from "mercadopago";

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  try {
    const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
    if (!accessToken) {
      res.status(500).json({ error: "MERCADOPAGO_ACCESS_TOKEN no configurado" });
      return;
    }

    const client = new MercadoPagoConfig({ accessToken });
    const { items, payer, shipping } = req.body as {
      items: { title: string; unit_price: number; quantity: number; picture_url?: string; description?: string }[];
      payer: { email: string; name: string; phone?: string };
      shipping?: { cost: number; address?: { street?: string; zipCode?: string } };
    };

    if (!items || !Array.isArray(items) || items.length === 0) {
      res.status(400).json({ error: "Items inválidos" });
      return;
    }

    if (!payer || !payer.email || !payer.name) {
      res.status(400).json({ error: "Información del cliente incompleta" });
      return;
    }

    const siteUrl = process.env.SITE_URL || "https://moncatu.com";

    const preferenceItems = items.map((item) => ({
      title: String(item.title).slice(0, 256),
      unit_price: Number(item.unit_price),
      quantity: Number(item.quantity),
      currency_id: "MXN" as const,
      picture_url: item.picture_url || undefined,
      description: item.description ? String(item.description).slice(0, 256) : undefined,
    }));

    if (shipping && shipping.cost > 0) {
      preferenceItems.push({
        title: "Envío",
        unit_price: Number(shipping.cost),
        quantity: 1,
        currency_id: "MXN" as const,
        picture_url: undefined,
        description: undefined,
      });
    }

    const nameParts = payer.name.trim().split(/\s+/);
    const firstName = nameParts[0];
    const lastName = nameParts.slice(1).join(" ") || firstName;

    const preference = new Preference(client);
    const result = await preference.create({
      body: {
        items: preferenceItems,
        payer: {
          email: payer.email,
          name: firstName,
          surname: lastName,
          phone: payer.phone ? { number: payer.phone.replace(/\D/g, "") } : undefined,
          address: shipping?.address
            ? { street_name: shipping.address.street || "", zip_code: shipping.address.zipCode || "" }
            : undefined,
        },
        back_urls: {
          success: siteUrl + "/order-confirmation.html?status=approved",
          failure: siteUrl + "/order-confirmation.html?status=rejected",
          pending: siteUrl + "/order-confirmation.html?status=pending",
        },
        auto_return: "approved",
        statement_descriptor: "MONCATU",
        external_reference: "moncatu_" + Date.now(),
      },
    });

    res.json({
      id: result.id,
      init_point: result.init_point,
      sandbox_init_point: result.sandbox_init_point,
    });
  } catch (error: any) {
    console.error("Error creando preferencia de Mercado Pago:", error);
    res.status(500).json({
      error: "Error al crear la preferencia de pago",
      message: error.message,
    });
  }
}
