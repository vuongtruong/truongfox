package com.younetco.plugin;

import com.jeremyfeinstein.slidingmenu.lib.SlidingMenu;
import com.younetco.app.Container;
import org.apache.cordova.CallbackContext;
import org.apache.cordova.CordovaPlugin;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

/**
 * Created by namnv on 10/19/14.
 */
public class NativeControl extends CordovaPlugin {

    private static final String TAG = "yn/NativeControl";

    /**
     * void constructor
     */
    public NativeControl(){}

    /**
     * Executes the request and returns PluginResult.
     *
     * @param action            The action to execute.
     * @param args              JSONArray of arguments for the plugin.
     * @param callbackContext   The callback context used when calling back into JavaScript.
     * @return                  True when the action was valid, false otherwise.
     */
    public boolean execute(String action, JSONArray args, CallbackContext callbackContext) throws JSONException {
        /*
    	 * Don't run any of these if the current activity is finishing
    	 * in order to avoid android.view.WindowManager$BadTokenException
    	 * crashing the app. Just return true here since false should only
    	 * be returned in the event of an invalid action.
    	 */
        if(this.cordova.getActivity().isFinishing()) return true;

        if(action.equals("hidePrimarySlidingMenu")){
            this.hidePrimarySlidingMenu();
            return true;
        }else if (action.equals("showPrimarySlidingMenu")){
            this.showPrimarySlidingMenu();
            return true;
        }else if (action.equals("togglePrimarySlidingMenu")){
            this.togglePrimarySlidingMenu();
            return true;
        }else if(action.equals("lockPrimaryMenu")){
            this.lockPrimaryMenu();
            return true;
        }else if(action.equals("unlockPrimaryMenu")){
            this.unlockPrimaryMenu();
            return true;
        }else if(action.equals("updateMenuItems")){
            this.updateMenuItems(args);
            return true;
        }else if(action.equals("updateMenuViewer")){
            this.updateMenuViewer(args.getJSONObject(0));
            return  true;
        }else if (action.equals("setActiveItem")){
            this.updateActiveItem(args.getString(0));
            return  true;
        }
        return false;
    }

    /**
     * @return void
     * @param itemName
     */
    public void updateActiveItem(final String itemName){
        Container.getInstance().mainActivity.runOnUiThread(new Runnable() {
            @Override
            public void run() {
                Container.getInstance().mainActivity.activeSidebarItem(itemName);
            }
        });
    }

    public void hidePrimarySlidingMenu(){
        SlidingMenu slidingMenu  = Container.getInstance().slidingMenu;
        if(slidingMenu.isMenuShowing()){
            slidingMenu.toggle();
        }
    }

    public void showPrimarySlidingMenu(){
        SlidingMenu slidingMenu  = Container.getInstance().slidingMenu;
        if(false == slidingMenu.isMenuShowing()){
            slidingMenu.toggle();
        }
    }

    public void togglePrimarySlidingMenu(){
        Container.getInstance().mainActivity.runOnUiThread( new Runnable() {
            @Override
            public void run() {
                Container.getInstance().mainActivity.toggleMenu();
            }
        });

    }

    public void lockPrimaryMenu(){
        Container.getInstance().mainActivity.runOnUiThread(new Runnable() {
            @Override
            public void run() {
                Container.getInstance().mainActivity.lockMenu();
            }
        });
    }

    public void unlockPrimaryMenu(){
        Container.getInstance().mainActivity.runOnUiThread(new Runnable() {
            @Override
            public void run() {
                Container.getInstance().mainActivity.unlockMenu();
            }
        });
    }

    public void setActiveMenu(){
        Container.getInstance().mainActivity.runOnUiThread(new Runnable() {
            @Override
            public void run() {

            }
        });
    }


    public void updateMenuItems(JSONArray args){

        Container.getInstance().mainActivity.setJsonArrayMenuItems(args);

        Container.getInstance().mainActivity.getActivity().runOnUiThread(new Runnable() {
            @Override
            public void run() {
                Container.getInstance().mainActivity.updateMenuItems();
            }
        });

    }

    public void updateMenuViewer(JSONObject arg){

        Container.getInstance().mainActivity.setJsonObjectMenuViewer(arg);

        Container.getInstance().mainActivity.getActivity().runOnUiThread(new Runnable() {
            @Override
            public void run() {
                Container.getInstance().mainActivity.updateMenuViewer();
            }
        });
    }
}
