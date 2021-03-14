# https://etherscan.io/exportData?type=address&a=0xf157b7ba35089c9b0f02c24bbe1e03855dbe5c1f
import pandas as pd
import os
import json

df = pd.read_csv(f'{os.getcwd()}/src/3.13.21.csv')

from_to = df.loc[(df['Quantity'] > 0) & (df['Quantity'] <= 69)][['From', 'To']]

address_set = set(from_to['From']) | set(from_to['To'])
claims_dict = {a: 1 for a in address_set}

with open("claims.json", "w") as outfile:
    json.dump(claims_dict, outfile)
