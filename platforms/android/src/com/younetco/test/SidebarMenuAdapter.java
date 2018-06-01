package com.younetco.test;

        import android.content.Context;
        import android.view.LayoutInflater;
        import android.view.View;
        import android.view.ViewGroup;
        import android.widget.ArrayAdapter;
        import com.younetco.ionicon.IconTextView;
        import android.widget.TextView;
        import com.younetco.toolbox.SmartImageView;

        import java.util.HashMap;
        import java.util.Map;

/**
 * Created by namnv on 10/19/14.
 */
public class SidebarMenuAdapter extends ArrayAdapter<MenuItem> {

    final static String TAG = "yn/SidebarMenuAdapter";

    Map<String, View> mapItems = new HashMap<String, View>();

    View lastCheckedItem;

    public SidebarMenuAdapter(Context context) {
        super(context, 0);
    }

    @Override
    public int getViewTypeCount(){
        return 2;
    }

    public View getView(int position, View convertView, ViewGroup parent) {

        MenuItem menuItem = getItem(position);

        if(menuItem.type.equals("header")){
            convertView = LayoutInflater.from(getContext()).inflate(R.layout.sidebar_viewer, null);
        }else if (menuItem.type.equals("menu_group")){
            convertView = LayoutInflater.from(getContext()).inflate(R.layout.sidebar_menu_group, null);
        }else if (menuItem.type.equals("menu_submenu")){
            convertView = LayoutInflater.from(getContext()).inflate(R.layout.sidebar_menu_submenu, null);
        }else{
            convertView = LayoutInflater.from(getContext()).inflate(R.layout.sidebar_menu_item, null);
        }

        TextView title = (TextView) convertView.findViewById(R.id.sidebar_menu_label);

        if (menuItem.label != "") {
            title.setText(menuItem.label);
        }else{
            title.setText("");
        }

        if(menuItem.img != ""){
            SmartImageView icon = (SmartImageView) convertView.findViewById(R.id.sidebar_menu_icon);
            icon.setImageUrl(menuItem.img);
        }else{
            IconTextView icon = (IconTextView) convertView.findViewById(R.id.sidebar_menu_ionicon);
            if (null != icon) {
                icon.setText("{" + menuItem.icon + "}");
            }
        }

        mapItems.put(menuItem.menu, convertView);

        return convertView;
    }

    public void setActiveItem(View view) {

        if (null != view) {

            if (null != lastCheckedItem) {
                lastCheckedItem.setSelected(false);
            }
            view.setSelected(true);
            lastCheckedItem = view;
        }
    }

    public void setActiveItem(String menu) {

        View view = mapItems.get(menu);
        this.setActiveItem(view);
    }
}