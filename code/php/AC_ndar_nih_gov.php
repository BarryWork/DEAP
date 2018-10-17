<?php
 #
 # Access Control Code using NDAR.NIH.GOV
 #

 date_default_timezone_set('America/Los_Angeles');

 $audit_file = $_SERVER['DOCUMENT_ROOT']."/logs/audit.log";
 $audit_on = 1;

  function audit( $what, $message ) {
    global $audit_file, $audit_on;

    if (!$audit_on)
       return;

    if (!is_writable( $audit_file )) {
       return;
    }
    $e = new Exception;
    $callers = $e->getTraceAsString();
    $callers = explode("\n", $callers);
    if (strpos( $callers[1], "AC.php" ) !== FALSE)
       return; // called by myself, don't add

    $str = "[".date(DATE_RFC2822)."] [".$callers[1]."] ".$what.": ".trim(preg_replace('/\s+/', ' ', $message))."\n";
    file_put_contents( $audit_file, $str, FILE_APPEND );
  }

  // has to be logged in, forwards to login page if not
  function check_logged() {
     global $_SESSION, $USERS, $_SERVER;

     $ss = array_keys($_COOKIE);
     audit("Session Cookies (check_logged): ", "print out cookie values");
     foreach($ss as $k) {
        audit("   Cookie: ".$k, " value: ".$_COOKIE[$k]);
     }
     /*audit("check_logged Session variables: ", "print all of them");
     if (isset($_SESSION)) {
       	foreach(array_keys($_SESSION) as $k) {
             audit("   Session: ".$k," value: ".$_SESSION[$k]);
        }
        }*/
     if (!isset($_SESSION["logged"])) {
      	$qs = $_SERVER['QUERY_STRING'];
        audit( "check_logged"," failed, key logged does not exist", "" );
        if ($qs != "")
           header("Location: /applications/User/login.php?".$_SERVER['QUERY_STRING']."&url=".$_SERVER['PHP_SELF']);
        else
           header("Location: /applications/User/login.php"."?url=".$_SERVER['PHP_SELF']);
        return -1; // not logged in
     };
     // store that this user has logged in now (does not work on NDA)
     // setUserVariable( $_SESSION["logged"], "lastTimeLoggedIn", date(DATE_RFC2822) );

     audit( "check_logged", " as user \"".$_SESSION["logged"]."\"" );
     return $_SESSION["logged"];
  };

  // has to be logged in, forwards to login page if not
  function check_logged_only() {
      global $_SESSION, $USERS, $_SERVER;
      
      $ss = array_keys($_COOKIE);
      audit("Session Cookies: ", "print out cookie values");
      foreach($ss as $k) {
          audit("   Cookie: ".$k, " value: ".$_COOKIE[$k]);
      }
      audit("check_logged Session variables: ", "print all of them");
      foreach(array_keys($_SESSION) as $k) {
          audit("   Session: ".$k," value: ".$_SESSION[$k]);
      }
      if (!array_key_exists($_SESSION["logged"],$USERS)) {
          return FALSE;
      };
      // store that this user has logged in now
      setUserVariable( $_SESSION["logged"], "lastTimeLoggedIn", date(DATE_RFC2822) );
      
      audit( "check_logged", " as user \"".$_SESSION["logged"]."\"" );
      return TRUE;
  };

  // list all users, secure function, returns nothing if user is not logged in or
  // role is not admin
  function list_permissions_for_user( $user_in ) {
    global $_SESSION;

    return array();
  }

  function check_role( $name ) {
     return false;
  }

  function check_permission( $permission ) {
    return true;
  }

?>
