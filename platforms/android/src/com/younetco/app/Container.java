package com.younetco.app;

import com.jeremyfeinstein.slidingmenu.lib.SlidingMenu;
import com.younetco.test.MainActivity;
import org.apache.cordova.CordovaWebView;

/**
 * Created by namnv on 10/19/14.
 */
public class Container {

    private static final String TAG = "yn/Container";

    public MainActivity mainActivity = null;
    public SlidingMenu slidingMenu = null;
    public CordovaWebView cordovaWebView = null;
    private static Container instance = null;

    public static Container getInstance(){
        if(null == instance){
            instance = new Container();
        }
        return instance;
    }
}
