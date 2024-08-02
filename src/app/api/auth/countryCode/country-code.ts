export interface CountryInputDto {}

export interface CountryCode {
  country_name: string;
  phone_code: string;
  country_code: string;
}

export interface CountryOutputDto {
  countryCode: CountryCode[];
}
