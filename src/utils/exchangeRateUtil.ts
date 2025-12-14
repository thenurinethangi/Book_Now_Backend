import axios from "axios";

export async function getLkrToUsdRate(): Promise<number> {
    const res = await axios.get(
        "https://open.er-api.com/v6/latest/LKR"
    );

    if (res.data?.result !== "success") {
        throw new Error("Failed to fetch exchange rate");
    }

    return res.data.rates.USD;
}