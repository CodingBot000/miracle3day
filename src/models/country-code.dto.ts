export interface CountryInputDto {}

export interface CountryCode {
  country_name: string;
  country_code: string;
  phone_code: string;
  id?: number;
}

export interface CountryOutputDto {
  countryCode: CountryCode[];
}
