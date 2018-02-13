
<p> I needed all my transaction info for tax season and the BoA downloads option is limited and doesn't contain transaction type which is 
critical for taxes.</p>

### usage
1. input your username and password for your BoA account into the run.js file.
2. Set your date ranges here(it's preconfigured for 2017):
  * https://github.com/nkiermaier/boa_crawler/blob/master/run.js#L134
3. `node run.js`

<p>
Note:  You may have BoA authentication to undergo at initial login, ie security questions and captchas.
Input all your info into electron and hit the next buttons.
When you reach the main account page the bot should take back over.
</p>
