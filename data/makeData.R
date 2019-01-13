library(tidyverse)
library(stringr)
library(readxl)

good_gov <- read_csv("good_govt.csv", na = "-")
good_gov$small_country <- ifelse(good_gov$population <= 5000000, 1, 0)

# error with some of the World Bank variables in the original dataset
# source this data from World Bank's website
wb <- read_csv("WorldBank.csv")

# error with some of the Heritage variables in the original dataset
# source this data from Heritage's website
heritage <- read_excel("index_of_economic_freedom.xls", na = c("NA", "N/A", "n/a"))

heritage <- heritage %>%
  select(country_name = `Country Name`, judicial_effectiveness_score = `Judical Effectiveness`,
         government_integrity_score = `Government Integrity`, property_rights_score = `Property Rights`,
         tax_burden_score = `Tax Burden`, overall_economic_freedom_score = `2018 Score`,
         financial_freedom_score = `Financial Freedom`) %>%
  mutate(country_name = replace(country_name, country_name == "Burma", "Myanmar")) %>%
  mutate(country_name = replace(country_name, country_name == "Congo, Democratic Republic of the Congo", "Congo (Dem. Rep.)")) %>%
  mutate(country_name = replace(country_name, country_name == "Congo, Republic of", "Congo (Rep.)")) %>%
  mutate(country_name = replace(country_name, country_name == "Côte d'Ivoire", "Cote d'Ivoire")) %>%
  mutate(country_name = replace(country_name, country_name == "Gambia", "Gambia, The")) %>%
  mutate(country_name = replace(country_name, country_name == "Korea, North ", "Korea (Dem. People's Rep.)")) %>%
  mutate(country_name = replace(country_name, country_name == "Korea, South", "Korea (Rep.)")) %>%
  mutate(country_name = replace(country_name, country_name == "Kyrgyz Republic", "Kyrgyzstan")) %>%
  mutate(country_name = replace(country_name, country_name == "São Tomé and Príncipe", "Sao Tome and Principe"))

# overwrite columns with bad data in original dataset
good_gov <- good_gov %>%
  select(country_name:civil_liberties_score) %>%
  left_join(wb, by = c("country_code" = "WBCode")) %>%
  select(-country_name.y) %>%
  rename(country_name = country_name.x) %>%
  left_join(heritage, by = "country_name")

sum(good_gov$population) # 7,511,052,000

# count missing
missing <- good_gov %>% summarise_all(funs(sum(is.na(.))))


# rank countries based on well-being scores
metrics <- good_gov %>%
  select(country_name, population, gini, happy_planet_index, human_development_index,
         world_happiness_report_score, sustainable_development, gdp_percapita)
summary(metrics)

ranks <- metrics %>%
  mutate(hpi_rank = rank(-happy_planet_index),
         hdi_rank = rank(-human_development_index),
         whrs_rank = rank(-world_happiness_report_score),
         sd_rank = rank(-sustainable_development)) %>%
  rowwise() %>%
  mutate(avg_rank = mean(c(hpi_rank, hdi_rank, whrs_rank, sd_rank)),
         highest_rank = min(c(hpi_rank, hdi_rank, whrs_rank, sd_rank)),
         lowest_rank = max(c(hpi_rank, hdi_rank, whrs_rank, sd_rank)))

# get countries that appear in the top 20 for each metric
top20 <- tibble(
  hpi = ranks$country_name[ranks$hpi_rank <= 20],
  hdi = ranks$country_name[ranks$hdi_rank <= 20],
  whrs = ranks$country_name[ranks$whrs_rank <= 20],
  seda = ranks$country_name[ranks$sd_rank <= 20]
)

# get number of times each country appears in the top 20
topcountries <- top20 %>% 
  gather(key = "metric", value = "country") %>%
  count(country)

topcountries$country[topcountries$n ==1]

good_gov <- good_gov %>%
  mutate(top_country = case_when(
    country_name %in% topcountries$country[topcountries$n == 1] ~ 1,
    country_name %in% topcountries$country[topcountries$n > 1] ~ 2,
    TRUE ~ 0
  ))

# calculate percentiles for each metric
percentiles <- good_gov %>%
  mutate(health_expend_ntile = ntile(good_gov$health_expenditure_per_person, 100),
         edu_expend_ntile = ntile(good_gov$edu_expenditure_per_person, 100),
         poli_stab_ntile = ntile(good_gov$political_stability, 100),
         gov_effec_ntile = ntile(good_gov$gov_effectiveness, 100),
         reg_qual_ntile = ntile(good_gov$regulatory_quality, 100),
         rule_law_ntile = ntile(good_gov$rule_of_law, 100),
         corrupt_ntile = ntile(good_gov$control_corruption, 100),
         jud_effec_ntile = ntile(good_gov$judicial_effectiveness_score, 100),
         gov_integ_ntile = ntile(good_gov$government_integrity_score, 100),
         prop_rights_ntile = ntile(good_gov$property_rights_score, 100),
         ec_free_ntile = ntile(good_gov$overall_economic_freedom_score, 100),
         fin_free_ntile = ntile(good_gov$financial_freedom_score, 100)) %>%
  select(country_name, top_country, ends_with("_ntile")) %>%
  gather(key = "metric", value = "percentile", -country_name, -top_country) %>%
  #mutate(country_name = replace(country_name, country_name == "Gambia, The", "The Gambia"))
  write_csv(percentiles, "data/percentiles.csv")

# make final dataset
final <- good_gov %>%
  select(country_name, top_country, population, health_expenditure_per_person, edu_expenditure_per_person,
         political_stability, gov_effectiveness, regulatory_quality, rule_of_law, control_corruption, 
         judicial_effectiveness_score, government_integrity_score, property_rights_score, overall_economic_freedom_score,
         financial_freedom_score)

write_csv(final, "data/data.csv")
