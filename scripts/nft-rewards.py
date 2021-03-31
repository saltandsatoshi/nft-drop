'''
Export $SALTY transactions as `src/send-to-a-friend.csv`
https://etherscan.io/exportData?type=tokentxns&contract=0xf157b7ba35089c9b0f02c24bbe1e03855dbe5c1f&a=&decimal=18

Export ETH hoodie transactions as `src/eth-hoodie.csv`
https://etherscan.io/exportData?type=address&a=0x400a31ba7e9d428040b20eabdb329e54124f4013

Export BTC hoodie transactions as `src/btc-hoodie.csv`
https://etherscan.io/exportData?type=address&a=0xf6aa869d2a727565cc85ec90d8497ae72b3e0a4f
'''
import pandas as pd
import os
import json

df_friends = pd.read_csv(f'{os.getcwd()}/src/send-to-a-friend.csv')
from_to_friends = df_friends.loc[(df_friends['Quantity'] > 0) & (df_friends['Quantity'] <= 69)]

df_btc_hoodie = pd.read_csv(f'{os.getcwd()}/src/btc-hoodie.csv')
from_btc_hoodie = df_btc_hoodie.loc[(df_btc_hoodie['Value_IN(ETH)'] > 0) & (df_btc_hoodie['ErrCode'] != 'Reverted')]

df_eth_hoodie = pd.read_csv(f'{os.getcwd()}/src/eth-hoodie.csv')
from_eth_hoodie = df_eth_hoodie.loc[(df_eth_hoodie['Value_IN(ETH)'] > 0) & (df_eth_hoodie['ErrCode'] != 'Reverted')]

# Take the Senders/recipients of 69 $SALTY from the friends drop,
# while taking only senders of eth & btc hoodie drop as recipient is always the contract
address_set = set(from_to_friends['From']) | set(from_to_friends['To']) \
    | set(from_btc_hoodie['From']) | set(from_eth_hoodie['From'])

claims_dict = {a: 1 for a in address_set}
print(len(address_set))

with open("claims.json", "w") as outfile:
    json.dump(claims_dict, outfile)
