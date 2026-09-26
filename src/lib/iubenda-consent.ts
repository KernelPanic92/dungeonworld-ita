import { IUBENDA_ANALYTICS_PURPOSE } from "@/lib/tracking";

type IubendaCsApi = {
  isPurposeConsented?: (purposeId: number) => boolean;
};

type IubendaGlobal = {
  cs?: {
    api?: IubendaCsApi;
  };
};

function getIubendaApi(): IubendaCsApi | undefined {
  if (typeof window === "undefined") {
    return undefined;
  }

  const iub = (window as Window & { _iub?: IubendaGlobal })._iub;
  return iub?.cs?.api;
}

export function isAnalyticsPurposeConsented() {
  const api = getIubendaApi();
  if (!api?.isPurposeConsented) {
    return false;
  }

  const purposeId = Number(IUBENDA_ANALYTICS_PURPOSE);
  if (Number.isNaN(purposeId)) {
    return false;
  }

  return api.isPurposeConsented(purposeId);
}