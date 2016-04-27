
School Day Widget

This is a JSON driven configurable widget that displays the current school day. 
Configuration options include:
•	School Start Date
•	Last Day of School Date
•	School Start Date – next year
•	School Start Day  (1-n) 
•	Number of days in a rotation (1-n) - usually between 4 and 6
•	Array of days on which there is no school (anything except a weekend that interrupts sequential days - 
  ie: holidays, school vacations, snow days, teacher confrence days, and other).

Display is:
	 Today is Day  <schoolday 1-n>        “if today is  a school day”
Or <day name M-F> is Day  <1-n >        “if today is a skip day or weekend”
Or <Days Till School >    <ndays to start of school>   “if summer vacation”

