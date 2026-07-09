import areaDataJson from "china-area-data/data.json";

type AreaData = Record<string, Record<string, string>>;

export interface AreaOption {
  code: string;
  name: string;
}

const ROOT_CODE = "86";
const areaData = areaDataJson as AreaData;

const toOptions = (source?: Record<string, string>): AreaOption[] =>
  Object.entries(source ?? {}).map(([code, name]) => ({ code, name }));

const findCodeByName = (source: Record<string, string> | undefined, name: string): string | undefined =>
  Object.entries(source ?? {}).find(([, label]) => label === name)?.[0];

export const provinceOptions: AreaOption[] = toOptions(areaData[ROOT_CODE]);

export const getCityOptions = (provinceName: string): AreaOption[] => {
  const provinceCode = findCodeByName(areaData[ROOT_CODE], provinceName);
  return provinceCode ? toOptions(areaData[provinceCode]) : [];
};

export const getDistrictOptions = (provinceName: string, cityName: string): AreaOption[] => {
  const provinceCode = findCodeByName(areaData[ROOT_CODE], provinceName);
  const cityCode = provinceCode ? findCodeByName(areaData[provinceCode], cityName) : undefined;
  return cityCode ? toOptions(areaData[cityCode]) : [];
};
