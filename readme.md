
<p> I needed all my transaction info for tax season and the BoA downloads option is limited and doesn't contain transaction type which is 
critical for taxes.</p>

### usage
1. input your username and password for your BoA account into the run.js file.
2. Set your date ranges here(it's preconfigured for 2017):
  * https://github.com/nkiermaier/boa_crawler/blob/master/run.js#L134
3. `node run.js`
4. Let it run, it will take a while, because I didnt optimize it. 
 * You can just run it on an AWS workspace and go about your day. 
5. All of you files should be saved in the root directory of the project.
 * There will be a file per page, and a file called `final.json` which contains the entirety of the scrape.

<p>
Note:  You may have BoA authentication to undergo at initial login, ie security questions and captchas.
Input all your info into electron and hit the next buttons.
When you reach the main account page the bot should take back over.
</p>

<p>Note: Another option is to to use Plaid. </p>
* https://plaid.com/
