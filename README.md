# ReloadOnDemandExample

This runs against Qlik Sense Desktop as it doesn't have any authentication at the moment.

1. Clone this repo
2. Enter directory and run "npm install"
3. Run orchestrator in a cmd prompt like "node Orchestrator"
4. Run Databot in another cmd prompt like "node Databot"
5. Copy included QVF into the Qlik\Sense\Apps directory
6. Copy the "AppControl" Extension (mashup) into the Qlik\Sense\Extensions directory
7. Visit http://localhost:4848/extensions/AppControl/AppControl.html and click 'Awaken Databot', then click Manual Reload to see the reload. The trigger condition met button doesn't do anything yet, but that's coming

See the PPTX file in this repo for overview reference.

Contact me if you have questions or issues! - chris.larsen@qlik.com
